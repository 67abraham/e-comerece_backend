export const aiCreateDescription =({name, imagUrl }:{name:string, imagUrl:string})=>{

    return async()=>{
        try {
            const freeKey = process.env.FREE_KEY
            const myHeaders = new Headers();
            myHeaders.append("Authorization", `Bearer ${freeKey}`);
            myHeaders.append("Content-Type", "application/json");
        
            const raw = JSON.stringify({
            "model": "openrouter/free",
        
            "messages": [
                {
                    "role": "Product Descriptor",
                    "content": `Your are a Expertise in Describing product to client in less them 100 word, view the product detail and describe it: productName:${name} productImage: ${imagUrl}`
                }
            ]
            });
            const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            };
        
           const res = await fetch("https://openrouter.ai/api/v1/chat/completions", requestOptions)
            .then((response) => {return response.json()})
            .catch((error) => console.error(error));
        
            return res.choices[0].message.content;
            
        } catch (error) {
            
        }
    }

}