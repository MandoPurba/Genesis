
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, IconForAccountType } from "@/lib/utils"
import { Landmark } from "lucide-react"

export type AccountData = {
    id: number;
    name: string;
    type: string | null;
    balance: number;
}

export function AccountBalancesCard({ accounts }: { accounts: AccountData[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Account Balances</CardTitle>
                <CardDescription>
                    Your current balance across all accounts.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {accounts.length > 0 ? (
                    <div className="space-y-4">
                        {accounts.map((account) => (
                            <div key={account.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <IconForAccountType accountType={account.type || 'Other'} className="w-5 h-5 text-muted-foreground" />
                                    <span className="font-medium">{account.name}</span>
                                </div>
                                <span className="font-semibold">{formatCurrency(account.balance)}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center rounded-lg bg-muted/50 p-10 min-h-[200px]">
                        <Landmark className="w-16 h-16 text-muted-foreground/50" />
                        <h3 className="text-lg font-semibold mt-4">No Accounts Found</h3>
                        <p className="text-muted-foreground text-sm">Add an account to see your balances here.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
