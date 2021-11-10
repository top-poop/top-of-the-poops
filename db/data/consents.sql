DROP TABLE IF EXISTS consents CASCADE;

create table consents
(
    COMPANY_NAME                 text,
    DISCHARGE_SITE_NAME          text,
    DISCHARGE_SITE_TYPE_CODE     text,
    DSI_TYPE_DESCRIPTION         text,
    ADD_OF_DISCHARGE_SITE_LINE_1 text,
    ADD_OF_DISCHARGE_SITE_LINE_2 text,
    ADD_OF_DISCHARGE_SITE_LINE_3 text,
    ADD_OF_DISCHARGE_SITE_LINE_4 text,
    ADD_OF_DISCHARGE_SITE_PCODE  text,
    DISTRICT_COUNCIL             text,
    DISCHARGE_NGR                text,
    CATC_NAME                    text,
    CATCHMENT_CODE               text,
    EA_REGION                    text,
    SOURCE                       text,
    PERMIT_NUMBER                text,
    PERMIT_VERSION               text,
    RECEIVING_WATER              text,
    RECEIVING_ENVIRON_TYPE_CODE  text,
    REC_ENV_CODE_DESCRIPTION     text,
    ISSUED_DATE                  timestamp,
    EFFECTIVE_DATE               timestamp,
    REVOCATION_DATE              timestamp,
    STATUS_OF_PERMIT             text,
    STATUS_DESCRIPTION           text,
    OUTLET_NUMBER                text,
    OUTLET_TYPE_CODE             text,
    OUTLET_TYPE_DESCRIPTION      text,
    OUTLET_GRID_REF              text,
    EFFLUENT_NUMBER              text,
    EFFLUENT_TYPE                text,
    EFF_TYPE_DESCRIPTION         text,
    EFFLUENT_GRID_REF            text
);

create index consents_permit_idx on consents(PERMIT_NUMBER);