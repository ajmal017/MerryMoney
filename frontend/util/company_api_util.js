export const fetchCompany = id => {
    return $.ajax({
        method: 'GET',
        url: `api/companies/${id}`,
    })
}

export const createCompany = company => (
    $.ajax({
        method: 'POST',
        url: 'api/companies',
        data: { company: company },
    })
);

export const fetchCompanyBasics = (ticker) => {
    return $.ajax({
        method: 'GET',
        url: `https://cloud.iexapis.com/stable/stock/${ticker}/company/batch?&types=quote&token=pk_706ac5ada3a7426a80d503d37ee02a8d`,
    })
}