import { PaymentMethod, PaymentRequest } from "xendit-node";
import { addMinutes } from "date-fns";
export const xenditPaymentRequestClient = new PaymentRequest({
secretKey : process.env.XENDIT_MONEY_IN_KEY!,
});

// create qris

type CreateQRISPaymentParams = {
    amout : number;
    orderId : string;
    expiresAt? : Date;
}

export const createQRISPayment = async(params : CreateQRISPaymentParams) => {
    const paymentReq = await xenditPaymentRequestClient.createPaymentRequest({
        data : {
            currency : "IDR",
            amount : params.amout,
            referenceId : params.orderId,
            paymentMethod : {
                reusability : "ONE_TIME_USE",
                type : "QR_CODE",
                qrCode : {
                    channelCode : "DANA",
                    channelProperties : {
                        expiresAt : params.expiresAt ?? addMinutes(new Date(), 15),
                    },
                },
                referenceId : params.orderId,
            }
        }
    });
    return paymentReq;
}
