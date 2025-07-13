
import {SgRecord} from "../model/sgRecord";

async function create(userId: number, modelId: number, requestData: string | null) {
    return SgRecord.query().create({
        user_id: userId,
        model_id: modelId,
        request_data: requestData,
        response_data: null,
        status: 'init',
    });
}

async function update(recordId: number, data: Partial<SgRecord>) {
    return SgRecord.query().where('id', recordId).update(data);
}

export default {
    create,
    update,
}
