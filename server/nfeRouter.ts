/**
 * Router para importação de NF-e
 */

import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { importarNFe } from "./nfeImporter";
import { validarNFeXML } from "./nfeParser";

export const nfeRouter = router({
  /**
   * Valida XML de NF-e sem processar
   */
  validate: publicProcedure
    .input(z.object({
      xmlContent: z.string().min(1, "XML não pode estar vazio"),
    }))
    .mutation(async ({ input }) => {
      const validacao = validarNFeXML(input.xmlContent);
      
      if (!validacao.valido) {
        throw new Error(validacao.erro || "XML inválido");
      }

      return {
        success: true,
        message: "XML válido",
      };
    }),

  /**
   * Importa XML de NF-e e registra entrada de produtos
   */
  import: publicProcedure
    .input(z.object({
      xmlContent: z.string().min(1, "XML não pode estar vazio"),
    }))
    .mutation(async ({ input }) => {
      try {
        const result = await importarNFe(input.xmlContent);

        if (!result.success) {
          throw new Error(
            result.erros.length > 0
              ? result.erros.join("; ")
              : "Erro ao importar NF-e"
          );
        }

        return {
          success: true,
          message: `NF-e ${result.nfeInfo.numero} importada com sucesso!`,
          data: result,
        };
      } catch (error) {
        throw new Error(
          `Erro ao importar NF-e: ${(error as Error).message}`
        );
      }
    }),
});
