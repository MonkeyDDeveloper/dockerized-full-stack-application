interface IAudit {
    _id: string;
    productId: string;
    changes: {[key: string]: any};
    updatedAt: string;
}

export {

    type IAudit

}