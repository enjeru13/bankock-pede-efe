export interface Client {
    co_cli: string;
    cli_des: string;
    co_seg?: string;
    co_ven?: string;
    rif?: string;
    direc1?: string;
    telefonos?: string;
    email?: string;
    phone?: string;
    inactivo?: number;
    documents_count?: number;
    categories_count?: number;
    is_complete?: boolean;
    formatted_total_size?: string;
}

export interface ClientDetail extends Client {
    address?: string;
    notes?: string;
    documents?: Document[];
}

export interface Document {
    id: number;
    title: string;
    description?: string;
    filename: string;
    file_size: number;
    formatted_size: string;
    category?: string;
    category_obj?: { id: number; name: string };
    category_id?: number;
    downloaded_count: number;
    created_at: string;
    client_id: number | string;
    uploaded_by?: {
        id: number;
        name: string;
    };
}
