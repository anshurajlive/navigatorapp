import { Ticket } from './ticket.model';

export class User {
    public Id : number;
    public Name : string;
    public Age :number;
    public Email : string;
    public Password : string;
    public AverageRating : number;
    public Tickets : Array<Ticket> = new Array<Ticket>();

}