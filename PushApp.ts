import {
    IAppAccessors,
    IConfigurationExtend,
    IEnvironmentRead,
    ILogger,
} from '@rocket.chat/apps-engine/definition/accessors';
import { ApiSecurity, ApiVisibility } from '@rocket.chat/apps-engine/definition/api';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { SettingType } from '@rocket.chat/apps-engine/definition/settings';
import { CreateRoomEndpoint } from './endpoints/CreateRoomEndpoint';
import { RocketEndpoint } from './endpoints/RocketEndpoint';
// import { ReceiveMessageEndpoint } from './endpoints/ReceiveMessageEndpoint';
import {
    CONFIG_BASE_URL,
    CONFIG_CLOSE_TICKET_FLOW,
    CONFIG_FLOW_MEDIA_TOKEN,
    CONFIG_PUSH_TOKEN,
    CONFIG_QUEUED_TOKEN_FLOW,
    CONFIG_RC_CRM_URL,
    CONFIG_TAKEN_TOKEN_FLOW,
    CONFIG_TIMEOUT_VALUE,
} from './utils/settings';

export class PushApp extends App {
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);

    }

    public async extendConfiguration(configuration: IConfigurationExtend, environmentRead: IEnvironmentRead): Promise<void> {

        await configuration.api.provideApi({
            visibility: ApiVisibility.PUBLIC,
            security: ApiSecurity.UNSECURE,
            endpoints: [
                new RocketEndpoint(this),
                new CreateRoomEndpoint(this),
            ],
        });

        await configuration.settings.provideSetting({
            id:  CONFIG_PUSH_TOKEN,
            type: SettingType.STRING,
            packageValue: '',
            required: true,
            public: false,
            i18nLabel: 'Push_Token',
        });

        await configuration.settings.provideSetting({
            id:  CONFIG_CLOSE_TICKET_FLOW,
            type: SettingType.STRING,
            packageValue: '',
            required: true,
            public: false,
            i18nLabel: 'Close_Ticket_Flow',
        });

        await configuration.settings.provideSetting({
            id:  CONFIG_QUEUED_TOKEN_FLOW,
            type: SettingType.STRING,
            packageValue: '',
            required: false,
            public: false,
            i18nLabel: 'Queued_Token_Flow',
        });

        await configuration.settings.provideSetting({
            id:  CONFIG_TAKEN_TOKEN_FLOW,
            type: SettingType.STRING,
            packageValue: '',
            required: false,
            public: false,
            i18nLabel: 'Taken_Token_Flow',
        });

        await configuration.settings.provideSetting({
            id:  CONFIG_BASE_URL,
            type: SettingType.STRING,
            packageValue: '',
            required: true,
            public: false,
            i18nLabel: 'Base_URL',
        });

        await configuration.settings.provideSetting({
            id:  CONFIG_RC_CRM_URL,
            type: SettingType.STRING,
            packageValue: '',
            required: false,
            public: false,
            i18nLabel: 'RC_CRM_URL',
        });

        await configuration.settings.provideSetting({
            id:  CONFIG_FLOW_MEDIA_TOKEN,
            type: SettingType.STRING,
            packageValue: '',
            required: false,
            public: false,
            i18nLabel: 'Flow_Media_Token',
        });

        await configuration.settings.provideSetting({
            id:  CONFIG_TIMEOUT_VALUE,
            type: SettingType.NUMBER,
            packageValue: 30,
            required: true,
            public: false,
            i18nLabel: 'Timeout (sec)',
        });

    }
}
