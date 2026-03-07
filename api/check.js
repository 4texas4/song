export default async function handler(req, res) {

res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
res.setHeader("Access-Control-Allow-Headers", "*");

if (req.method === "OPTIONS") {
return res.status(200).end();
}

try {

const { tid } = req.query;

if(!tid){
return res.status(400).json({error:"missing tid"});
}

const url = `https://api.apps.web.id/spotify/check/${tid}`;

const r = await fetch(url,{
headers:{
"accept":"*/*",
"accept-language":"en-US,en;q=0.9",
"referer":"https://afianf.vercel.app/",
"origin":"https://afianf.vercel.app",
"user-agent":"Mozilla/5.0"
}
});

const text = await r.text();
const data = JSON.parse(text);

res.status(200).json(data);

}catch(err){

res.status(500).json({
error:"proxy crashed",
message:err.message
});

}

}
