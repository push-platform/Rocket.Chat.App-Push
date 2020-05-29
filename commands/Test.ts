import { ISlashCommand, SlashCommandContext } from "@rocket.chat/apps-engine/definition/slashcommands";
import { IRead, IModify, IHttp, IPersistence } from "@rocket.chat/apps-engine/definition/accessors";
import { PushApp } from "../PushApp";

export class Test implements ISlashCommand {

    command: string;
    i18nParamsExample: string;
    i18nDescription: string;
    permission?: string | undefined;
    providesPreview: boolean;

    constructor(private readonly app: PushApp) {
        this.command = "test";
        this.i18nParamsExample = "Message ID";
        this.i18nDescription = "Will send the full message with the desired Title";
        this.providesPreview = false;
    }


    public async executor(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp, persis: IPersistence): Promise<void> {

        // const slug = await read.getEnvironmentReader().getSettings().getValueById('slug');
        // const push_token = await read.getEnvironmentReader().getSettings().getValueById('push_token');
        // const close_tckt_flow = await read.getEnvironmentReader().getSettings().getValueById('close_tckt_flow');
        // const queued_token_flow = await read.getEnvironmentReader().getSettings().getValueById('queued_token_flow');
        // const taken_token_flow = await read.getEnvironmentReader().getSettings().getValueById('taken_token_flow');
        // const base_url = await read.getEnvironmentReader().getSettings().getValueById('base_url');
        // const rc_crm_url = await read.getEnvironmentReader().getSettings().getValueById('rc_crm_url');
        // const flow_media_token = await read.getEnvironmentReader().getSettings().getValueById('flow_media_token');

        // const site_url = await read.getEnvironmentReader().getServerSettings().getValueById("Site_Url")
        // console.log("Site Url: ", site_url)
        // // const site_name = await read.getEnvironmentReader().getServerSettings().getValueById("Site_Name")
        // const x_auth_tkn = await read.getEnvironmentReader().getSettings().getValueById("rc_ptkn")
        // const x_user_id = await read.getEnvironmentReader().getSettings().getValueById("rc_uid")
        // console.log("Auths: ", x_auth_tkn, x_user_id)
        // // console.log("fields: ", slug, push_token, close_tckt_flow, queued_token_flow, taken_token_flow, base_url, rc_crm_url,  flow_media_token)
        // // console.log("Server settings: ", site_url, site_name)

        // const departments = await http.get(site_url + "/api/v1/livechat/department", {headers: {"X-Auth-Token": x_auth_tkn, "X-User-Id": x_user_id}})

        console.log("AAAAAAAAAAAAa")

    } 


}