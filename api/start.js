export default async function handler(req, res) {

try {

const { gid, track } = req.query;

if(!gid || !track){
return res.status(400).json({error:"missing gid or track"});
}

const url = `https://api.apps.web.id/spotify/start/${gid}/${track}`;

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
return res.status(403).json({
error:"API blocked request",
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
