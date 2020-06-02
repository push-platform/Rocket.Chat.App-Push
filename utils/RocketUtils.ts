import { IRead, IHttp, IHttpResponse } from "@rocket.chat/apps-engine/definition/accessors"

export class RocketUtils {
    private xAuthToken;
    private xUserId;
    private siteUrl;
    private timeoutValue;
    private http : IHttp;
    private read : IRead;

    public constructor(read, http, xAuth, xUser, siteUrl, timeout) {
        this.read = read;
        this.http = http;
        this.xAuthToken = xAuth;
        this.xUserId = xUser;
        this.siteUrl = siteUrl;
        this.timeoutValue = timeout >= 5 ? timeout : 5
    }

    public async departmentIdFromName(department_name) : Promise<string> {

        const departmentsResponse = await this.http.get(this.siteUrl + "/api/v1/livechat/department", {
            headers: this.getAuthHeaders(),
            // timeout: this.getTimeout()
        })
        if(!departmentsResponse.content) {
            throw Error("Failed to get department Id from name")
        }

        const departments = JSON.parse(departmentsResponse.content).departments

        console.log("Departments: ", departments)

        const department = departments.find( e => e.name === department_name )

        console.log("Department: ", department);        

        return department._id
    }

    public async createVisitor(visitor) : Promise<IHttpResponse> {
    

        const visitorResponse = await this.http.post(this.siteUrl + "/api/v1/livechat/visitor", 
            {
                headers: this.getAuthHeaders(),
                content: JSON.stringify(visitor),
                // timeout: this.getTimeout()
            }
        )

        console.log("Visitor response: ", visitorResponse)

        return visitorResponse

    }

    public async createRoom(visitorToken, priority?) : Promise<IHttpResponse> {

        // TODO: Check priority field for eterprise editions
        const payload = {
            token: visitorToken,
            // priority: priority ? priority : "null" 
        }

        const roomResponse = await this.http.get(this.siteUrl + "/api/v1/livechat/room", 
            {
                headers: this.getAuthHeaders(),
                params: payload,
                // timeout: this.getTimeout()
            }
        )

        console.log("Room response: ", roomResponse)

        return roomResponse
        
    }

    public async createVisitorMessage(token : string, roomId : string, message : string) : Promise<IHttpResponse> {

        const payload = {
            token: token,
            rid: roomId,
            msg: message
        }

        const visitorMessageResponse = await this.http.post(this.siteUrl + "/api/v1/livechat/message", 
            {
                headers: this.getAuthHeaders(),
                data: payload,
                // timeout: this.getTimeout()
            }
        )

        console.log("Visitor Message Response: ", visitorMessageResponse)

        return visitorMessageResponse
        
    }

    public getAuthHeaders() {
        return {"X-Auth-Token": this.xAuthToken, "X-User-Id": this.xUserId}
    }

    public setXAuthToken(value : string) {
        this.xAuthToken = value
    }

    public setXUserId(value : string) {
        this.xUserId = value
    }

    public setSiteUrl(value : string) {
        this.siteUrl = value
    }

    public setTimeoutValue(value : number) {
        this.timeoutValue = value
    }

    public getTimeout() {
        return this.timeoutValue >= 5 ? this.timeoutValue : 5
    }


}
