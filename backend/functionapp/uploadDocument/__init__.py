import azure.functions as func
import logging
from utils.file_utils import allowed_file, save_upload_file
from multipart import MultipartParser
from io import BytesIO

uploadDocument_blueprint = func.Blueprint()

@uploadDocument_blueprint.route(route="uploadDocument", methods=["POST"], auth_level=func.AuthLevel.FUNCTION)
def upload_document(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("Received request to upload a legal document.")

    try:
        content_type = req.headers.get('Content-Type')
        if not content_type:
            return func.HttpResponse("Missing Content-Type header.", status_code=400)

        body = req.get_body()
        if not body:
            return func.HttpResponse("Empty request body.", status_code=400)

        parser = parser = MultipartParser(body, content_type)  # body is already bytes

        file_part = next((part for part in parser.parts() if part.name == "file"), None)

        if not file_part or not file_part.filename:
            return func.HttpResponse("No file uploaded.", status_code=400)

        if not allowed_file(file_part.filename):
            return func.HttpResponse("Invalid file type. Only PDF and DOCX are supported.", status_code=400)

        saved_path = save_upload_file(file_part)  # Pass the multipart part directly

        return func.HttpResponse(f"File uploaded successfully: {saved_path}", status_code=200)

    except Exception as e:
        logging.error(f"Upload failed: {e}")
        return func.HttpResponse("Internal server error.", status_code=500)