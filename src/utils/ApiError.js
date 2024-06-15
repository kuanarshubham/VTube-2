class ApiError extends Error{
    constructor(statusCode, message = "Something went wrong", errors = [], stack = ""){
        super(message, stack);
        this.statusCode = statusCode;
        this.error = errors;
        this.data = null;
        this.sucess = false;
    }
}

export {ApiError}

//Error class(node) - message , stack, name