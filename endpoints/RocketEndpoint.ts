import { ApiEndpoint, IApiResponse, IApiRequest, IApiEndpointInfo } from "@rocket.chat/apps-engine/definition/api";
import { IRead, IModify, IHttp, IPersistence } from "@rocket.chat/apps-engine/definition/accessors";
import { RapidproUtils } from "../utils/RapidproUtils";

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

        const baseUrl = await read.getEnvironmentReader().getSettings().getValueById("base_url")
        const authToken = await read.getEnvironmentReader().getSettings().getValueById("push_token")
        const closeTicket = await read.getEnvironmentReader().getSettings().getValueById("close_tckt_flow")

        const rapidProUtils = new RapidproUtils(read, http, baseUrl, authToken, closeTicket);

        const rc = request.content
        console.log("Request Content Object: ", rc)

        const data = {
            visitor: rc.visitor,
            agent: rc.agent,
            contactUuid: rc.visitor.customFields.contactUuid,
            token: rc.visitor.token,
            type: rc.type,
            tags: rc.tags,
            messages: rc.messages,
        }

        let contacts;
        if(data.contactUuid) {
            contacts = [data.contactUuid]
        } else {
            contacts = [data.token]
        }

        // TODO: Check if serialization is necessary

        if(data.type === "Message") {
            await rapidProUtils.broadcastMessages(data.messages, contacts);
        } else if(data.type === "LivechatSession") {
            const extra = {
                agent: data.agent,
                livechat: data
            }
           await rapidProUtils.closeSession(extra, contacts);
        }        

        return this.success();
    }

}