export default async function handler(req, res) {

res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
res.setHeader("Access-Control-Allow-Headers", "*");

if (req.method === "OPTIONS") {
return res.status(200).end();
}

try {

const { tid } = req.query;

if (!tid) {
return res.status(400).json({ error: "missing tid" });
}

const url = `https://api.apps.web.id/spotify/check/${tid}`;

const r = await fetch(url,{
method:"GET",
headers:{
"accept":"*/*",
"accept-language":"en-US,en;q=0.9",
"cache-control":"no-cache",
"pragma":"no-cache",
"referer":"https://afianf.vercel.app/",
"origin":"https://afianf.vercel.app",
"user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36"
}
});

const text = await r.text();

let data;

try{
data = JSON.parse(text);
}catch{
return res.status(500).json({
error:"API returned HTML instead of JSON",
raw:text.slice(0,200)
});
}

res.status(200).json(data);

}catch(err){

res.status(500).json({
error:"proxy crashed",
message:err.message
});

}

}
