import { serverHttp } from './http';
import './websocket';

serverHttp.listen(8080, () => console.log('server running on port 8080'));
