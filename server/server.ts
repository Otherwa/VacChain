import { type Serve } from "bun";
import Blockchain from "../bloc/blockchain";
import { HEADERS } from "./config";

const blockchain: Blockchain = new Blockchain();

Bun.serve({
  development: true,
  fetch(req) {
    const url = new URL(req.url);

    console.log(`Request coming from: ${req.headers.get("Host")}`);

    switch (url.pathname) {
      case "/":
        const data = blockchain.getBlockchainData();
        return new Response(JSON.stringify(data), {
          headers: HEADERS,
        });

      case "/peers":
        console.log(`Peer node: ${req.headers.get("User-Agent")}`);
        return new Response("Peers", {
          headers: HEADERS,
        });
    }

    return new Response("404!", {
      headers: HEADERS,
    });
  },
}) satisfies Serve;
