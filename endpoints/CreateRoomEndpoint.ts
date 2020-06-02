import { ApiEndpoint, IApiResponse, IApiRequest, IApiEndpointInfo } from "@rocket.chat/apps-engine/definition/api";
import { IRead, IModify, IHttp, IPersistence, HttpStatusCode } from "@rocket.chat/apps-engine/definition/accessors";
import { RocketUtils } from "../utils/RocketUtils";
import { RapidproUtils } from "../utils/RapidproUtils";
import { IApiResponseJSON } from "@rocket.chat/apps-engine/definition/api/IResponse";
import { CACHE_KEY_ROOM_ID } from '../utils/settings'

export class CreateRoomEndpoint extends ApiEndpoint {
    public path = "create-room/webhook";   
    
    public async get(
        request: IApiRequest,
        endpoint: IApiEndpointInfo,
        read: IRead, 
        modify: IModify,
        http: IHttp,
        persis: IPersistence
    ) : Promise<IApiResponseJSON> {

        const department_name = request.query.department;
        let contact_uuid = request.query.contactUuid;
        const priority = request.params.priority;
        const visitor = this.getVisitorFromParams(request.query);
        if (!contact_uuid) {
            contact_uuid = request.query.token;
        }
        
        const xauth = request.headers["x-auth-token"];
        const xuser = request.headers["x-user-id"];
        const siteUrl = await read.getEnvironmentReader().getServerSettings().getValueById("Site_Url");    
        const timeoutValue = await read.getEnvironmentReader().getSettings().getValueById("timeout_value");       
        const rocketUtils = new RocketUtils(read, http, xauth, xuser, siteUrl, timeoutValue);

        const baseUrl = await read.getEnvironmentReader().getSettings().getValueById("base_url")
        const authToken = await read.getEnvironmentReader().getSettings().getValueById("push_token")
        const closeTicket = await read.getEnvironmentReader().getSettings().getValueById("close_tckt_flow")
        const rapidProUtils = new RapidproUtils(read, http, baseUrl, authToken, closeTicket);
        
        const newRoom = await this.createRoom(rocketUtils, rapidProUtils, visitor, priority, department_name, contact_uuid);

        return newRoom

    }

    public getVisitorFromParams(params: object): object {
        let visitor : object = {}
        const customFields : object[] = [];

        Object.keys(params).map( (key, index) => {
            if( ['name', 'email', 'token', 'phone'].includes(key) ) {
                visitor[key] = params[key];
            } else {
                let newField = {key: key, value: params[key], overwrite: true}
                customFields.push(newField);
            }
        })
        
        visitor["customFields"] = []
        customFields.map(e => {
            visitor["customFields"].push(e)
        })

        return {visitor: visitor};
    }

    public async createRoom(rocketUtils, rapidProUtils, visitor, priority, department_name, contact_uuid, msgs_after?) : Promise<IApiResponseJSON> {

        const key = CACHE_KEY_ROOM_ID.concat(contact_uuid)

        if(department_name) {
            const department_id = await rocketUtils.departmentIdFromName(department_name);
            visitor.visitor["department"] = department_id;
        }

        const token = visitor.visitor.token;
        const createdVisitor = await rocketUtils.createVisitor(visitor)
        const createdRoom = await rocketUtils.createRoom(token, priority)
        const after = msgs_after ? msgs_after : this.getNowDate()  
        const logMessage = await rapidProUtils.getLogMessages(contact_uuid, after)

        if(createdVisitor.statusCode !== 200) {
            return createdVisitor
        } else if(createdRoom.statusCode !== 200) {
            return createdRoom
        }

        const room = createdRoom.data.room

        if(logMessage) {
            const roomId = room._id
            await rocketUtils.createVisitorMessage(token, roomId, logMessage)
        }

        const roomResponse : IApiResponseJSON = {
            status: HttpStatusCode.OK,
            content: createdRoom.data,
        }
        
        return roomResponse
    }

    public getNowDate() : string {
        let date = new Date();
        let now = date.toJSON().slice(0, 10)
        return now.concat("T00:00:00")
    }


}