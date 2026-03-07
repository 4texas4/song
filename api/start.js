export default async function handler(req, res) {

try {

const { gid, track } = req.query;

if (!gid || !track) {
return res.status(400).json({
error: "Missing gid or track",
query: req.query
});
}

const url = `https://api.apps.web.id/spotify/start/${gid}/${track}`;

const r = await fetch(url,{
headers:{
"referer":"https://afianf.vercel.app/",
"origin":"https://afianf.vercel.app",
"accept":"*/*",
"user-agent":"Mozilla/5.0"
}
});

const text = await r.text();

let data;

try{
data = JSON.parse(text);
}catch{
return res.status(500).json({
error:"API did not return JSON",
raw:text
});
}

return res.status(200).json(data);

}catch(err){

return res.status(500).json({
error:"Serverless function crashed",
message:err.message
});

}

}
