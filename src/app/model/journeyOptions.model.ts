export class JourneyOption {
    public JourneyId : number;
    public JourneyTimeInMins : string;
    public Distance : string;
    public DistanceUnit : string;
    public ValidFrom : string;
    public ValidTo : string;
    public Fare : string;
    public Currency : string;
    public JourneySubOptions : Array<JourneySubOption> = new Array<JourneySubOption>(); 
    public RouteId : number;

}

export class JourneySubOption{
    public CommuteType : string;
    public ValidFrom : string;
    public ValidTo : string;
    public Distance : string;
    public DistanceUnit : string;
    public JourneyTimeInMins : string;
    public Fare : string;
    public Currency : string;
}