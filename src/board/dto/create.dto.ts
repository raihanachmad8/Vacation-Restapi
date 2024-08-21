export class CreateBoardRequest {
  cover?: Express.Multer.File;
  title: string;
  user_id: string;
}
