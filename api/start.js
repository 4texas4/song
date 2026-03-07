export default async function handler(req, res) {

const { gid, track } = req.query;

if(!gid || !track){
return res.status(400).json({error:"missing gid or track"});
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

const data = await r.json();

res.status(200).json(data);

}
