export const HTTP_STATUS = {
    CREATED: 201,
    OK: 200,
    NOT_FOUND: 404
}

export const HTTP_METHOD = {
    POST: 'POST',
    PATCH: 'PATCH',
    PUT: 'PUT',
    DELETE: 'DELETE',
    GET: 'GET'
}

export const handleMethod = (method, req, handler) => {
    if(req.method === method){
        handler()
    }
}