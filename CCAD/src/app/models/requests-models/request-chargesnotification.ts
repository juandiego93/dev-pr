export class RequestChargesNotification {
  headerRequest:HeaderChargesNotification;
  chargeService: string;
  accountNumber: string;
  amount: string;
  remark: string;
}
class HeaderChargesNotification{
  idBusinessTransaction: string;
  idApplication: string;
  target: string;
  userApplication: string;
  password: string;
  startDate: string;
  ipApplication: string;
  idESBTransaction: string;
  userSession: string;
  channel: string;
  additionalNode: string;
}
