export interface ShareData {
  title: string;
  text?: string;
  url: string;
}

/**
 * Usa a Web Share API nativa quando disponível (abre o menu de
 * compartilhamento do sistema); cai para copiar o link se não houver suporte.
 * Retorna o que aconteceu, pra a tela poder avisar o usuário.
 */
export async function sharePlace(data: ShareData): Promise<"shared" | "copied" | "cancelled"> {
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share(data);
      return "shared";
    } catch {
      return "cancelled";
    }
  }

  if (typeof navigator !== "undefined" && navigator.clipboard) {
    await navigator.clipboard.writeText(data.url);
    return "copied";
  }

  return "cancelled";
}
