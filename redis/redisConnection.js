const {createClient}=require("redis")

const redisConn=async ()=>{
    
    const client = createClient({url:process.env.REDIS_URL});
    client.on('error', (err) => console.log('Redis Client Error', err));
    console.log("Redis server connected")
    await client.connect();
    return client
}

module.exports=redisConn