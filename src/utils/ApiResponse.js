class ApiResponse{
    constructor(statusCode, data, message= "Sucess"){
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
    }
}

export  {ApiResponse};