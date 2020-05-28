import { ApiEndpoint, IApiResponse, IApiRequest, IApiEndpointInfo } from "@rocket.chat/apps-engine/definition/api";
import { IRead, IModify, IHttp, IPersistence } from "@rocket.chat/apps-engine/definition/accessors";

export class RocketEndpoint extends ApiEndpoint {
    public path = "rocket/webhook";
    
    public async post(
        request: IApiRequest,
        endpoint: IApiEndpointInfo,
        read: IRead, 
        modify: IModify,
        http: IHttp,
        persis: IPersistence
    ) : Promise<IApiResponse> {

        this.app.getLogger().debug(request)
        console.log(">>: ", request)

        return this.success();
    }
}