import mongoose from "mongoose";
import dns from "dns";

const MONGODB_URI = process.env.MONGODB_URI || "";

let cached = (global as any).mongoose;
if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

/**
 * Manually resolves a mongodb+srv:// URI into a direct mongodb:// URI
 * using a custom DNS resolver (Google/Cloudflare DNS) to bypass ISP-level
 * DNS blocking of SRV/TXT record lookups (queryTxt ETIMEOUT).
 */
async function resolveAtlasSrv(srvUri: string): Promise<string> {
  const resolver = new dns.promises.Resolver();
  resolver.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1", "1.0.0.1"]);

  // Parse credentials and dbname from the mongodb+srv:// URI
  const withoutScheme = srvUri.replace(/^mongodb\+srv:\/\//, "");
  const atIdx = withoutScheme.lastIndexOf("@");
  const credentials = withoutScheme.substring(0, atIdx); // user:pass
  const rest = withoutScheme.substring(atIdx + 1);       // hostname/dbname?options
  const slashIdx = rest.indexOf("/");
  const hostname = slashIdx !== -1 ? rest.substring(0, slashIdx) : rest;
  const pathAndQuery = slashIdx !== -1 ? rest.substring(slashIdx) : "/";

  console.log(`[DB] Resolving SRV for ${hostname}...`);

  // Resolve SRV records: _mongodb._tcp.<hostname>
  const srvRecords = await resolver.resolveSrv(`_mongodb._tcp.${hostname}`);
  if (!srvRecords.length) throw new Error("No SRV records found for Atlas cluster");

  const hosts = srvRecords.map((r) => `${r.name}:${r.port}`).join(",");
  console.log(`[DB] Resolved ${srvRecords.length} hosts: ${hosts}`);

  // Resolve TXT records for extra options (authSource, replicaSet) — ignore if missing
  // Atlas TXT records use URL query string format: "authSource=admin&replicaSet=atlas-xxx-shard-0"
  let txtOptions: Record<string, string> = {};
  try {
    const txtRecords = await resolver.resolveTxt(hostname);
    for (const parts of txtRecords) {
      // Each TXT record may be split into multiple strings — join them first
      const params = new URLSearchParams(parts.join(""));
      params.forEach((v, k) => { txtOptions[k.trim()] = v.trim(); });
    }
    console.log("[DB] TXT options:", txtOptions);
  } catch (_) {
    console.log("[DB] No TXT records found (using defaults)");
  }

  // Build query params — start from existing URI params
  const qIdx = pathAndQuery.indexOf("?");
  const dbPath = qIdx !== -1 ? pathAndQuery.substring(0, qIdx) : pathAndQuery;
  const existingParams = qIdx !== -1 ? new URLSearchParams(pathAndQuery.substring(qIdx + 1)) : new URLSearchParams();

  // Apply TXT options as defaults (URI params take priority)
  if (txtOptions.authSource && !existingParams.has("authSource")) existingParams.set("authSource", txtOptions.authSource);
  if (txtOptions.replicaSet && !existingParams.has("replicaSet")) existingParams.set("replicaSet", txtOptions.replicaSet);

  // Atlas always requires TLS
  if (!existingParams.has("tls") && !existingParams.has("ssl")) existingParams.set("tls", "true");

  const directUri = `mongodb://${credentials}@${hosts}${dbPath}?${existingParams.toString()}`;
  return directUri;
}

async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
  }

  // Return existing healthy connection
  if (cached.conn) {
    if (cached.conn.connection?.readyState === 1) {
      return cached.conn;
    }
    console.warn("[DB] Stale connection detected, reconnecting...");
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
      family: 4,
    };

    cached.promise = (async () => {
      let connectUri = MONGODB_URI;

      // If using mongodb+srv://, manually resolve SRV/TXT using reliable DNS
      // bypassing queryTxt ETIMEOUT caused by ISP-level DNS blocking
      if (connectUri.startsWith("mongodb+srv://")) {
        try {
          connectUri = await resolveAtlasSrv(connectUri);
          console.log("[DB] Using direct connection (SRV resolved manually)");
        } catch (resolveErr) {
          console.warn("[DB] SRV resolution failed, falling back to native driver SRV:", (resolveErr as any)?.message);
          // Fall back to original URI; driver will try its own DNS resolution
          connectUri = MONGODB_URI;
        }
      }

      console.log("[DB] Connecting...");
      const m = await mongoose.connect(connectUri, opts);
      console.log("[DB] Connected successfully!");

      m.connection.on("disconnected", () => {
        console.warn("[DB] Disconnected — will reconnect on next request");
        cached.conn = null;
        cached.promise = null;
      });
      m.connection.on("error", (err) => console.error("[DB] Connection error:", err));

      return m;
    })().catch((err) => {
      const code = (err as any)?.code || (err as any)?.name || "UNKNOWN";
      const msg = (err as any)?.message || String(err);
      console.error(`[DB] Connection failed [${code}]: ${msg}`);
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    const code = (e as any)?.code || (e as any)?.name || "UNKNOWN";
    const msg = (e as any)?.message || String(e);
    throw new Error(`Database connection failed [${code}]: ${msg}`);
  }

  return cached.conn;
}

const connectDB = connectToDatabase;

export { connectDB, connectToDatabase };
export default connectToDatabase;