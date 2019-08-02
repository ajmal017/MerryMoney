import * as APICompUtil from '../util/company_api_util';

export const RECEIVE_COMPANY = "RECEIVE_COMPANY";
export const RECEIVE_COMPANIES = "RECEIVE_COMPANIES";
export const RECEIVE_COMPANY_BASICS = "RECEIVE_COMPANY_BASICS";
export const RECEIVE_COMPANY_KEY_STATS = "RECEIVE_COMPANY_KEY_STATS"

const receiveCompany = (company) => {
    return({
        type: RECEIVE_COMPANY,
        company,
    })
}

const receiveCompanies = companies => ({
    type: RECEIVE_COMPANIES,
    companies,
});

const receiveCompanyBasics = (company_data) => {
    return({
        type: RECEIVE_COMPANY_BASICS,
        ticker: company_data.symbol,
        company_data,
    })
}

const receiveCompanyKeyStats = (stats) => {
    return({
        type: RECEIVE_COMPANY_KEY_STATS,
        stats, 
    })
}

export const fetchCompany = (ticker) => (dispatch) => {    
    return APICompUtil.fetchCompany(ticker).then((company) => dispatch(receiveCompany(company), (err) => dispatch(receiveErrors(err))));
}

export const fetchCompanies = () => dispatch => (
    APICompUtil.fetchCompanies().then(companies => dispatch(receiveCompanies(companies)))
);

export const createCompany = (company) => (dispatch) => {
    return APICompUtil.createCompany(company).then( (company) => dispatch(receiveCompany(company)));
}

export const fetchCompanyBasics = (ticker) => (dispatch) => {
    return APICompUtil.fetchCompanyBasics(ticker).then( (company_data) => dispatch(receiveCompanyBasics(company_data)));
}

export const fetchCompanyKeyStats = (ticker) => (dispatch) => {
    return APICompUtil.fetchCompanyKeyStats(ticker).then( (stats) => dispatch(receiveCompanyKeyStats(stats)));
}



