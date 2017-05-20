declare var store: {
    CONSUMABLE : string;

    register(product: { id: string;alias: string;type });
    order(id: string): OrderPromise;
    get(query: string): StoreProduct;
    when(query: string): WhenPromise;
    refresh(): void;
    sandbox: boolean;//test for windows store

    //undocumented
    products: StoreProduct[];
};



interface StoreProduct {
    id: string;
    alias: string;
    type: string;
    state: string;
    title: string;
    description: string;
    price: string;
    currency?: string;
    loaded: boolean;
    valid: boolean;
    canPurchase: boolean;
    owned: boolean;
    transaction: any;

    finish: () => void;
    verify: () => VerifyPromise
}

interface VerifyPromise {
    done: (callback: ((product: StoreProduct) => void)) => VerifyPromise;
    expired: (callback: ((product: StoreProduct) => void)) => VerifyPromise;
    success: (callback: ((product: StoreProduct, purchaseData) => void)) => VerifyPromise;
    error: (callback: ((err: StoreError) => void)) => VerifyPromise;
}

interface OrderPromise {
    then: any;
    error: any;
}

interface WhenPromise{
    loaded: (callback: ((product: StoreProduct) => void)) => void;
    updated: (callback: ((product: StoreProduct) => void)) => void;
    error: (callback: ((err: StoreError) => void)) => void;
    approved: (callback: ((product: StoreProduct) => void)) => void;
    owned: (callback: ((product: StoreProduct) => void)) => void;
    cancelled: (callback: ((product: StoreProduct) => void)) => void;
    refunded: (callback: ((product: StoreProduct) => void)) => void;
    registered: (callback: ((product: StoreProduct) => void)) => void;
    valid: (callback: ((product: StoreProduct) => void)) => void;
    invalid: (callback: ((product: StoreProduct) => void)) => void;
    requested: (callback: ((product: StoreProduct) => void)) => void;
    initiated: (callback: ((product: StoreProduct) => void)) => void;
    finished: (callback: ((product: StoreProduct) => void)) => void;
    verified: (callback: ((product: StoreProduct) => void)) => void;
    unverified: (callback: ((product: StoreProduct) => void)) => void;
    expired: (callback: ((product: StoreProduct) => void)) => void;
    downloading: (callback: ((product: StoreProduct, progress, time_remaining) => void)) => void;
    downloaded: (callback: ((product: StoreProduct) => void)) => void;
}

interface StoreError {
    code: number;
    message: string;
}
