import axios, { AxiosResponse } from "axios";

const summarize=async(
    transcript:string
):Promise<string|undefined>=>{
    try{
        if(transcript){
            const response = await axios.post('http://localhost:4000/summarize',{
                body:transcript
            },
        {
            headers:{
                "Content-Type":"application/json",
            },
        }
    )
    const data = response.data;
      const summary_dict = data[0]
      const summary = summary_dict.summary_text
      console.log(summary)
      return summary;
        }else{
            console.log("failed to fetch transcript");
        }
    }catch(error){
        console.error('Error summarizing meeting:', error);
    }
}
export default summarize;