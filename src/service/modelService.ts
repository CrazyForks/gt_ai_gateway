import {ModelConfig} from "../model/modelConfig";


async function getModel(modelName:string):Promise<ModelConfig | null> {

    if(modelName === "qwen-plus"){
        let config = new ModelConfig();
        config.name = "qwen-plus";
        config.vendor_id = null;
        //config.url = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";

        return config;
    }

    return null;
}

export default {
    getModel
}
