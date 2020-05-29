import { IRead, IHttp, IHttpResponse } from "@rocket.chat/apps-engine/definition/accessors"

export class RocketCaller {
    public static x_auth_token = ""
    public static x_user_id = ""
    public static site_url = ""

    public static getAuthHeaders() {
        return {"X-Auth-Token": RocketCaller.x_auth_token, "X-User-Id": RocketCaller.x_user_id}
    }

    public static async rocketDepartmentIdFromName(http : IHttp, department_name) : Promise<string> {

        const departmentsResponse = await http.get(RocketCaller.site_url + "/api/v1/livechat/department", {
            headers: RocketCaller.getAuthHeaders()
        })
        if(!departmentsResponse.content) {
            throw Error("Failed to get department Id from name")
        }

        const departments = JSON.parse(departmentsResponse.content).departments

        const department = departments.find( e => e.name === department_name )

        return department._id
    }

    public static async rocketCreateVisitor(http : IHttp, visitor) : Promise<IHttpResponse> {
    

        const visitorResponse = await http.post(RocketCaller.site_url + "/api/v1/livechat/visitor", 
            {
                headers: RocketCaller.getAuthHeaders(),
                content: JSON.stringify(visitor)
            }
        )

        console.log("Visitor response: ", visitorResponse)

        return visitorResponse

    }

    public static async rocketCreateRoom(http : IHttp, visitorToken, priority?) : Promise<IHttpResponse> {

        // TODO: Check priority field for eterprise editions
        const payload = {
            token: visitorToken,
            // priority: priority ? priority : "null" 
        }

        const roomResponse = await http.get(RocketCaller.site_url + "/api/v1/livechat/room", 
            {
                headers: RocketCaller.getAuthHeaders(),
                params: payload
            }
        )

        console.log("Room response: ", roomResponse)

        return roomResponse
        
    }

    public static async rocketCreateVisitorMessage(http : IHttp, token : string, roomId : string, message : string) : Promise<IHttpResponse> {

        const payload = {
            token: token,
            rid: roomId,
            msg: message
        }

        const visitorMessageResponse = await http.post(RocketCaller.site_url + "/api/v1/livechat/message", 
            {
                headers: RocketCaller.getAuthHeaders(),
                data: payload
            }
        )

        console.log("Visitor Message Response: ", visitorMessageResponse)

        return visitorMessageResponse
        
    }


}
