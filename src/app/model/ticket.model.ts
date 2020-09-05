export class Ticket {
    public TicketId : number;
    public TicketNumber : string;
    public Owner : string;
    public JourneyTiming :string;
    public ValidFrom : string;
    public ValidTo : string;
    public Fare : number;
    public FareCurrency : string;
    public RouteId : number;
    public Route : string;
    //public TransportationMode : Array<string> = new Array<string>();
    public Status : string;
    public PaymentStatus : string;
    public Review : number;
    public SubTickets : Array<SubTicket> = new Array<SubTicket>();

}

export class SubTicket {
    public TicketId : number;
    public TicketNumber : string;
    public ValidFrom : string;
    public ValidTo : string;
    public Review : number;
    public TransportationMode : string;
}