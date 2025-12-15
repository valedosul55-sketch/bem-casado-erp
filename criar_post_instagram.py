#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import os

# Caminhos das imagens
produto_path = "/home/ubuntu/bem_casado_loja/produto_arroz_integral_real.webp"
loja_path = "/home/ubuntu/bem_casado_loja/loja_fabrica_bem_casado.webp"
output_path = "/home/ubuntu/bem_casado_loja/post_instagram_final.png"

# Dimensões do post Instagram (quadrado)
width, height = 1080, 1080

# Criar canvas
canvas = Image.new('RGB', (width, height), (255, 255, 255))

# Carregar e processar imagem da loja (fundo)
loja = Image.open(loja_path)
loja = loja.resize((width, int(height * 0.6)), Image.Resampling.LANCZOS)

# Escurecer um pouco a loja para dar destaque ao produto
enhancer = ImageEnhance.Brightness(loja)
loja = enhancer.enhance(0.7)

# Colar loja no topo
canvas.paste(loja, (0, 0))

# Criar gradiente na parte inferior
gradient = Image.new('RGB', (width, int(height * 0.45)), (255, 255, 255))
draw_grad = ImageDraw.Draw(gradient)

# Gradiente suave de branco para rosa/vermelho
for y in range(int(height * 0.45)):
    # Cor rosa/vermelho da Bem Casado: #D91656
    r = int(255 - (255 - 217) * (y / (height * 0.45)))
    g = int(255 - (255 - 22) * (y / (height * 0.45)))
    b = int(255 - (255 - 86) * (y / (height * 0.45)))
    draw_grad.rectangle([(0, y), (width, y+1)], fill=(r, g, b))

# Colar gradiente
canvas.paste(gradient, (0, int(height * 0.55)))

# Carregar produto
produto = Image.open(produto_path)

# Redimensionar produto mantendo proporção
produto_height = int(height * 0.5)
produto_width = int(produto.width * (produto_height / produto.height))
produto = produto.resize((produto_width, produto_height), Image.Resampling.LANCZOS)

# Adicionar sombra ao produto
shadow = Image.new('RGBA', (produto_width + 40, produto_height + 40), (0, 0, 0, 0))
shadow_draw = ImageDraw.Draw(shadow)
shadow_draw.ellipse([10, produto_height + 10, produto_width + 30, produto_height + 35], fill=(0, 0, 0, 80))
shadow = shadow.filter(ImageFilter.GaussianBlur(15))

# Posicionar produto no centro-direita
produto_x = width - produto_width - 50
produto_y = int(height * 0.35)

# Colar sombra e produto
if produto.mode == 'RGBA':
    canvas.paste(shadow, (produto_x - 20, produto_y - 20), shadow)
    canvas.paste(produto, (produto_x, produto_y), produto)
else:
    canvas.paste(shadow, (produto_x - 20, produto_y - 20), shadow)
    canvas.paste(produto, (produto_x, produto_y))

# Adicionar textos
draw = ImageDraw.Draw(canvas)

# Tentar carregar fontes do sistema
try:
    font_title = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 70)
    font_subtitle = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 50)
    font_text = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 40)
    font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 35)
except:
    font_title = ImageFont.load_default()
    font_subtitle = ImageFont.load_default()
    font_text = ImageFont.load_default()
    font_small = ImageFont.load_default()

# Texto principal: "DEGUSTAÇÃO GRATUITA"
text1 = "DEGUSTAÇÃO"
text2 = "GRATUITA"

# Posição do texto (esquerda)
text_x = 60
text_y = int(height * 0.45)

# Adicionar sombra no texto
shadow_offset = 3
draw.text((text_x + shadow_offset, text_y + shadow_offset), text1, font=font_title, fill=(0, 0, 0, 100))
draw.text((text_x, text_y), text1, font=font_title, fill=(255, 255, 255))

draw.text((text_x + shadow_offset, text_y + 80 + shadow_offset), text2, font=font_title, fill=(0, 0, 0, 100))
draw.text((text_x, text_y + 80), text2, font=font_title, fill=(255, 255, 255))

# Subtítulo: "Arroz Integral"
text_y += 180
draw.text((text_x + shadow_offset, text_y + shadow_offset), "Arroz Integral", font=font_subtitle, fill=(0, 0, 0, 100))
draw.text((text_x, text_y), "Arroz Integral", font=font_subtitle, fill=(255, 255, 255))

# Data e horário
text_y += 80
draw.text((text_x, text_y), "Sábado, 06/12", font=font_text, fill=(255, 255, 255))
text_y += 50
draw.text((text_x, text_y), "7h às 13h", font=font_text, fill=(255, 255, 255))

# Preço
text_y += 80
draw.text((text_x, text_y), "R$ 23,00", font=font_subtitle, fill=(255, 255, 255))
draw.text((text_x + 180, text_y + 15), "fardo 10kg", font=font_small, fill=(255, 255, 255))

# Salvar
canvas.save(output_path, quality=95)
print(f"Post criado com sucesso: {output_path}")
