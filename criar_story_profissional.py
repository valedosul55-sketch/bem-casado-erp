#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import subprocess
import os
import math

# Configurações
fps = 30
duration = 15
total_frames = fps * duration
width, height = 1080, 1920

# Caminhos
produto_path = "/home/ubuntu/bem_casado_loja/produto_arroz_integral_real.webp"
loja_path = "/home/ubuntu/bem_casado_loja/loja_fabrica_bem_casado.webp"
frames_dir = "/home/ubuntu/bem_casado_loja/story_frames_pro"
output_video = "/home/ubuntu/bem_casado_loja/story_degustacao_profissional.mp4"

os.makedirs(frames_dir, exist_ok=True)

# Carregar imagens
produto_img = Image.open(produto_path)
loja_img = Image.open(loja_path)

# Fontes
try:
    font_title = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 90)
    font_subtitle = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 55)
    font_price = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 110)
    font_info = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 48)
except:
    font_title = font_subtitle = font_price = font_info = ImageFont.load_default()

print(f"Gerando {total_frames} frames profissionais...")

for frame_num in range(total_frames):
    progress = frame_num / total_frames
    
    # Canvas branco clean
    canvas = Image.new('RGB', (width, height), (255, 255, 255))
    draw = ImageDraw.Draw(canvas)
    
    # === SEGMENTO 1 (0-4s): Produto em destaque com zoom suave ===
    if progress < 0.27:
        seg_progress = progress / 0.27
        
        # Fundo branco com sutil gradiente
        for y in range(height):
            gray = int(255 - (y / height) * 10)
            draw.line([(0, y), (width, y)], fill=(gray, gray, gray))
        
        # Produto com zoom suave (1.2x -> 1.0x)
        zoom = 1.2 - (seg_progress * 0.2)
        prod_w = int(width * 0.85 * zoom)
        prod_h = int(produto_img.height * (prod_w / produto_img.width))
        produto_resized = produto_img.resize((prod_w, prod_h), Image.Resampling.LANCZOS)
        
        # Centralizar produto
        prod_x = (width - prod_w) // 2
        prod_y = int(height * 0.35) - int((prod_h - int(height * 0.5)) / 2)
        
        # Sombra sutil
        shadow = Image.new('RGBA', (prod_w + 60, prod_h + 60), (0, 0, 0, 0))
        shadow_draw = ImageDraw.Draw(shadow)
        shadow_draw.ellipse([20, prod_h + 20, prod_w + 40, prod_h + 50], fill=(0, 0, 0, 40))
        shadow = shadow.filter(ImageFilter.GaussianBlur(25))
        
        if produto_resized.mode == 'RGBA':
            canvas.paste(shadow, (prod_x - 30, prod_y - 30), shadow)
            canvas.paste(produto_resized, (prod_x, prod_y), produto_resized)
        else:
            canvas.paste(shadow, (prod_x - 30, prod_y - 30), shadow)
            canvas.paste(produto_resized, (prod_x, prod_y))
        
        # Texto superior com fade
        alpha = int(min(seg_progress * 2, 1) * 255)
        txt_overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
        txt_draw = ImageDraw.Draw(txt_overlay)
        
        txt_draw.text((width//2, 180), "DEGUSTAÇÃO GRATUITA", font=font_title, 
                     fill=(217, 22, 86, alpha), anchor="mm")
        txt_draw.text((width//2, 280), "Arroz Integral Bem Casado", font=font_subtitle, 
                     fill=(80, 80, 80, alpha), anchor="mm")
        
        canvas.paste(txt_overlay, (0, 0), txt_overlay)
    
    # === SEGMENTO 2 (4-8s): Informações do evento ===
    elif progress < 0.53:
        seg_progress = (progress - 0.27) / 0.26
        
        # Fundo: Loja escurecida
        loja_resized = loja_img.resize((width, int(height * 0.5)), Image.Resampling.LANCZOS)
        enhancer = ImageEnhance.Brightness(loja_resized)
        loja_dark = enhancer.enhance(0.4)
        canvas.paste(loja_dark, (0, 0))
        
        # Gradiente branco na parte inferior
        for y in range(int(height * 0.4), height):
            alpha_val = int(((y - height * 0.4) / (height * 0.6)) * 255)
            overlay = Image.new('RGBA', (width, 1), (255, 255, 255, alpha_val))
            canvas.paste(overlay, (0, y), overlay)
        
        # Cards de informação com slide-in
        card_offset = int((1 - seg_progress) * 200)
        
        # Card 1: Data
        card_y = 700
        draw.rounded_rectangle(
            [(80 + card_offset, card_y), (width - 80, card_y + 150)],
            radius=20, fill=(217, 22, 86)
        )
        draw.text((width//2, card_y + 50), "SÁBADO", font=font_subtitle, 
                 fill=(255, 255, 255), anchor="mm")
        draw.text((width//2, card_y + 110), "06 de Dezembro", font=font_info, 
                 fill=(255, 255, 255), anchor="mm")
        
        # Card 2: Horário
        card_y = 900
        draw.rounded_rectangle(
            [(80 - card_offset, card_y), (width - 80, card_y + 150)],
            radius=20, fill=(50, 50, 50)
        )
        draw.text((width//2, card_y + 75), "7h às 13h", font=font_title, 
                 fill=(255, 255, 255), anchor="mm")
        
        # Título no topo
        txt_overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
        txt_draw = ImageDraw.Draw(txt_overlay)
        txt_draw.text((width//2, 150), "VENHA NOS VISITAR", font=font_title, 
                     fill=(255, 255, 255, 255), anchor="mm")
        
        # Sombra no texto
        shadow_overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
        shadow_draw = ImageDraw.Draw(shadow_overlay)
        shadow_draw.text((width//2 + 3, 153), "VENHA NOS VISITAR", font=font_title, 
                        fill=(0, 0, 0, 180), anchor="mm")
        shadow_overlay = shadow_overlay.filter(ImageFilter.GaussianBlur(3))
        
        canvas.paste(shadow_overlay, (0, 0), shadow_overlay)
        canvas.paste(txt_overlay, (0, 0), txt_overlay)
    
    # === SEGMENTO 3 (8-12s): Preço em destaque ===
    elif progress < 0.8:
        seg_progress = (progress - 0.53) / 0.27
        
        # Fundo gradiente rosa para branco
        for y in range(height):
            ratio = y / height
            r = int(217 + (255 - 217) * ratio)
            g = int(22 + (255 - 22) * ratio)
            b = int(86 + (255 - 86) * ratio)
            draw.line([(0, y), (width, y)], fill=(r, g, b))
        
        # Preço gigante com animação de escala
        scale = 0.5 + (seg_progress * 0.5)
        price_size = int(200 * scale)
        
        try:
            font_price_big = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", price_size)
        except:
            font_price_big = font_price
        
        # Círculo de fundo
        circle_radius = 350
        draw.ellipse(
            [(width//2 - circle_radius, height//2 - circle_radius),
             (width//2 + circle_radius, height//2 + circle_radius)],
            fill=(255, 255, 255), outline=(217, 22, 86), width=8
        )
        
        # Preço
        draw.text((width//2, height//2 - 80), "R$", font=font_title, 
                 fill=(100, 100, 100), anchor="mm")
        draw.text((width//2, height//2 + 50), "23,00", font=font_price_big, 
                 fill=(217, 22, 86), anchor="mm")
        draw.text((width//2, height//2 + 200), "fardo 10kg", font=font_info, 
                 fill=(100, 100, 100), anchor="mm")
        
        # Texto superior
        draw.text((width//2, 200), "PREÇO ESPECIAL", font=font_title, 
                 fill=(255, 255, 255), anchor="mm")
    
    # === SEGMENTO 4 (12-15s): CTA Final ===
    else:
        seg_progress = (progress - 0.8) / 0.2
        
        # Fundo: Loja + overlay escuro
        loja_full = loja_img.resize((width, int(loja_img.height * (width / loja_img.width))), 
                                     Image.Resampling.LANCZOS)
        loja_full = loja_full.crop((0, 0, width, height))
        enhancer = ImageEnhance.Brightness(loja_full)
        loja_dark = enhancer.enhance(0.3)
        canvas.paste(loja_dark, (0, 0))
        
        # Overlay escuro
        overlay_dark = Image.new('RGBA', (width, height), (0, 0, 0, 150))
        canvas.paste(overlay_dark, (0, 0), overlay_dark)
        
        # CTA Box central
        box_h = 600
        box_y = (height - box_h) // 2
        draw.rounded_rectangle(
            [(100, box_y), (width - 100, box_y + box_h)],
            radius=30, fill=(255, 255, 255)
        )
        
        # Textos no box
        y_pos = box_y + 100
        draw.text((width//2, y_pos), "Experimente", font=font_subtitle, 
                 fill=(100, 100, 100), anchor="mm")
        
        y_pos += 100
        draw.text((width//2, y_pos), "ARROZ", font=font_title, 
                 fill=(217, 22, 86), anchor="mm")
        y_pos += 100
        draw.text((width//2, y_pos), "INTEGRAL", font=font_title, 
                 fill=(217, 22, 86), anchor="mm")
        
        y_pos += 120
        draw.text((width//2, y_pos), "Bem Casado Alimentos", font=font_info, 
                 fill=(80, 80, 80), anchor="mm")
        
        y_pos += 80
        draw.text((width//2, y_pos), "Sábado • 7h-13h", font=font_info, 
                 fill=(80, 80, 80), anchor="mm")
    
    # Salvar frame
    frame_path = os.path.join(frames_dir, f"frame_{frame_num:04d}.png")
    canvas.save(frame_path)
    
    if frame_num % 45 == 0:
        print(f"Progresso: {int(progress * 100)}%")

print("Frames gerados! Criando vídeo...")

ffmpeg_cmd = [
    "ffmpeg", "-y", "-framerate", str(fps),
    "-i", os.path.join(frames_dir, "frame_%04d.png"),
    "-c:v", "libx264", "-pix_fmt", "yuv420p",
    "-crf", "20", "-preset", "slow",
    output_video
]

subprocess.run(ffmpeg_cmd, check=True, capture_output=True)

print("Limpando...")
for f in os.listdir(frames_dir):
    os.remove(os.path.join(frames_dir, f))
os.rmdir(frames_dir)

print(f"✅ Vídeo profissional criado: {output_video}")
