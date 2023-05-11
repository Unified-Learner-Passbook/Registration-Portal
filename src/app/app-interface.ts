export interface IState {
  "stateCode": string,
  "stateName": string
}

export interface IDistrict {
  "districtCode": string
  "districtName": string
}

export interface IBlock {
  "blockCode": string
  "blockName": string
}

export interface ISchool {
  "udiseCode": string,
  "schoolName": string,
  "eduStateCode": string,
  "eduDistrictCode": string,
  "eduBlockCode": string,
  "eduClusterCode": string,
  "lgdStateId": number,
  "lgdDistrictId": number,
  "schCategoryId": number,
  "schTypeId": number,
  "schMgmtId": number,
  "schMgmtCenterId": number,
  "schStatusId": number,
  "schLocTypeId": number,
  "lowestClass": number,
  "highestClass": number,
  "prePrimaryAvailability": number,
  "prePrimaryClassFrom": number,
  "estdYear": string,
  "address": string,
  "pinCode": string,
  "email": string
}
