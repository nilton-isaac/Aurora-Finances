export interface Database {
  public: {
    Tables: {
      cards: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          limit_amount: number;
          due_day: number;
          closing_day: number;
          last_digits: string;
          gradient: string;
          created_at: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          description: string;
          value: number;
          category: string;
          type: "income" | "expense";
          month_key: string;
          source: "manual" | "installment";
          card_id: string | null;
          installment_id: string | null;
          created_at: string;
        };
      };
      installments: {
        Row: {
          id: string;
          user_id: string;
          card_id: string;
          description: string;
          total_value: number;
          installments: number;
          purchase_month_key: string;
          created_at: string;
        };
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          target: number;
          current: number;
          icon: string;
          accent: string;
          created_at: string;
        };
      };
      report_preferences: {
        Row: {
          user_id: string;
          email: string;
          enabled: boolean;
          frequency: "monthly" | "weekly";
          updated_at: string;
        };
      };
    };
  };
}

