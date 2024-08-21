export class UpdateBoardRequest {
    board_id: string;
    cover?: Express.Multer.File;
    title: string;
    user_id: string;
}