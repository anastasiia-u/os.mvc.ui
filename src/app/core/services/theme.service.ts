import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { TenantThemeModel } from "../models/tenant-theme.model";

@Injectable({
    providedIn: 'root'
})
export class ThemeService {

    private theme$ = new BehaviorSubject<TenantThemeModel | null>(null);

    applyTheme(model: TenantThemeModel | null): void {
        if (!model) {
            return;
        }
        this.theme$.next(model);

        const tenantColor = this.theme$.value?.tenantColorTheme;

        if (!tenantColor) {
            return;
        }

        this.setTenantColorTheme('--theme-color', tenantColor);
        this.setTenantColorTheme('--custom-background', this.hexToRGB(tenantColor, 0.15));
    }

    setTenantColorTheme(variable: string, color: string) {
        document.documentElement.style.setProperty(variable, color);
    }

    getLogoUrl() {
        return this.theme$?.value?.url || '';
    }

    private hexToRGB(hex: string, alpha = 1): string {
        var r = parseInt(hex.slice(1, 3), 16),
            g = parseInt(hex.slice(3, 5), 16),
            b = parseInt(hex.slice(5, 7), 16);

        return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
    }
}