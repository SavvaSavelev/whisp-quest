export async function spiritGossip(fromSpirit: string, toSpirit: string) {
    const res = await fetch("http://localhost:4000/spirit-gossip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spirits: [fromSpirit, toSpirit] })
    });
  
    const data = await res.json();
    return data; // { from, to, text }
  }
  