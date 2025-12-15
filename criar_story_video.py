#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import subprocess
import os

# Configurações
fps = 30
duration = 15  # segundos
total_frames = fps * duration
width, height = 1080, 1920  # Formato Story (9:16)

# Caminhos
base_image_path = "/home/ubuntu/bem_casado_loja/post_instagram_final.png"
frames_dir = "/home/ubuntu/bem_casado_loja/story_frames"
output_video = "/home/ubuntu/bem_casado_loja/story_degustacao.mp4"

# Criar diretório para frames
os.makedirs(frames_dir, exist_ok=True)

# Carregar imagem base
base_img = Image.open(base_image_path)

# Redimensionar para formato Story mantendo proporção
aspect_ratio = base_img.width / base_img.height
if aspect_ratio > (width / height):
    # Imagem mais larga
    new_width = width
    new_height = int(width / aspect_ratio)
else:
    # Imagem mais alta
    new_height = height
    new_width = int(height * aspect_ratio)

base_img = base_img.resize((new_width, new_height), Image.Resampling.LANCZOS)

# Tentar carregar fontes
try:
    font_huge = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 100)
    font_large = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 80)
    font_medium = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 60)
    font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 50)
except:
    font_huge = font_large = font_medium = font_small = ImageFont.load_default()

print(f"Gerando {total_frames} frames...")

for frame_num in range(total_frames):
    # Criar canvas
    canvas = Image.new('RGB', (width, height), (217, 22, 86))  # Rosa Bem Casado
    
    # Colar imagem base centralizada
    x_offset = (width - new_width) // 2
    y_offset = (height - new_height) // 2
    canvas.paste(base_img, (x_offset, y_offset))
    
    # Criar overlay para textos
    draw = ImageDraw.Draw(canvas)
    
    # Calcular progresso (0 a 1)
    progress = frame_num / total_frames
    
    # === ANIMAÇÃO POR SEGMENTOS ===
    
    # Segmento 1 (0-3s): "DEGUSTAÇÃO GRATUITA" aparece
    if progress < 0.2:
        alpha = int((progress / 0.2) * 255)
        text = "DEGUSTAÇÃO"
        text2 = "GRATUITA!"
        
        # Criar imagem temporária para texto com transparência
        txt_img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
        txt_draw = ImageDraw.Draw(txt_img)
        
        # Sombra
        txt_draw.text((width//2 + 5, 150 + 5), text, font=font_huge, fill=(0, 0, 0, alpha), anchor="mm")
        txt_draw.text((width//2, 150), text, font=font_huge, fill=(255, 255, 255, alpha), anchor="mm")
        
        txt_draw.text((width//2 + 5, 270 + 5), text2, font=font_huge, fill=(0, 0, 0, alpha), anchor="mm")
        txt_draw.text((width//2, 270), text2, font=font_huge, fill=(255, 255, 255, alpha), anchor="mm")
        
        canvas.paste(txt_img, (0, 0), txt_img)
    
    # Segmento 2 (3-6s): "Arroz Integral" aparece
    elif progress < 0.4:
        # Manter texto anterior
        draw.text((width//2 + 5, 150 + 5), "DEGUSTAÇÃO", font=font_huge, fill=(0, 0, 0), anchor="mm")
        draw.text((width//2, 150), "DEGUSTAÇÃO", font=font_huge, fill=(255, 255, 255), anchor="mm")
        draw.text((width//2 + 5, 270 + 5), "GRATUITA!", font=font_huge, fill=(0, 0, 0), anchor="mm")
        draw.text((width//2, 270), "GRATUITA!", font=font_huge, fill=(255, 255, 255), anchor="mm")
        
        # Novo texto com fade in
        alpha = int(((progress - 0.2) / 0.2) * 255)
        txt_img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
        txt_draw = ImageDraw.Draw(txt_img)
        
        txt_draw.text((width//2 + 5, 400 + 5), "Arroz Integral", font=font_large, fill=(255, 223, 0, alpha), anchor="mm")
        txt_draw.text((width//2, 400), "Arroz Integral", font=font_large, fill=(255, 223, 0, alpha), anchor="mm")
        
        canvas.paste(txt_img, (0, 0), txt_img)
    
    # Segmento 3 (6-10s): Data e horário
    elif progress < 0.67:
        # Manter textos anteriores
        draw.text((width//2 + 5, 150 + 5), "DEGUSTAÇÃO", font=font_huge, fill=(0, 0, 0), anchor="mm")
        draw.text((width//2, 150), "DEGUSTAÇÃO", font=font_huge, fill=(255, 255, 255), anchor="mm")
        draw.text((width//2 + 5, 270 + 5), "GRATUITA!", font=font_huge, fill=(0, 0, 0), anchor="mm")
        draw.text((width//2, 270), "GRATUITA!", font=font_huge, fill=(255, 255, 255), anchor="mm")
        draw.text((width//2, 400), "Arroz Integral", font=font_large, fill=(255, 223, 0), anchor="mm")
        
        # Data e horário com fade in
        alpha = int(((progress - 0.4) / 0.27) * 255)
        txt_img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
        txt_draw = ImageDraw.Draw(txt_img)
        
        txt_draw.text((width//2, 1400), "📅 SÁBADO, 06/12", font=font_medium, fill=(255, 255, 255, alpha), anchor="mm")
        txt_draw.text((width//2, 1500), "🕐 7h às 13h", font=font_medium, fill=(255, 255, 255, alpha), anchor="mm")
        
        canvas.paste(txt_img, (0, 0), txt_img)
    
    # Segmento 4 (10-15s): Preço e CTA
    else:
        # Manter todos os textos
        draw.text((width//2 + 5, 150 + 5), "DEGUSTAÇÃO", font=font_huge, fill=(0, 0, 0), anchor="mm")
        draw.text((width//2, 150), "DEGUSTAÇÃO", font=font_huge, fill=(255, 255, 255), anchor="mm")
        draw.text((width//2 + 5, 270 + 5), "GRATUITA!", font=font_huge, fill=(0, 0, 0), anchor="mm")
        draw.text((width//2, 270), "GRATUITA!", font=font_huge, fill=(255, 255, 255), anchor="mm")
        draw.text((width//2, 400), "Arroz Integral", font=font_large, fill=(255, 223, 0), anchor="mm")
        draw.text((width//2, 1400), "📅 SÁBADO, 06/12", font=font_medium, fill=(255, 255, 255), anchor="mm")
        draw.text((width//2, 1500), "🕐 7h às 13h", font=font_medium, fill=(255, 255, 255), anchor="mm")
        
        # Preço e CTA com fade in
        alpha = int(((progress - 0.67) / 0.33) * 255)
        txt_img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
        txt_draw = ImageDraw.Draw(txt_img)
        
        txt_draw.text((width//2, 1650), "💰 R$ 23,00", font=font_large, fill=(255, 223, 0, alpha), anchor="mm")
        txt_draw.text((width//2, 1770), "Venha nos visitar!", font=font_small, fill=(255, 255, 255, alpha), anchor="mm")
        
        canvas.paste(txt_img, (0, 0), txt_img)
    
    # Salvar frame
    frame_path = os.path.join(frames_dir, f"frame_{frame_num:04d}.png")
    canvas.save(frame_path)
    
    if frame_num % 30 == 0:
        print(f"Progresso: {int(progress * 100)}%")

print("Frames gerados! Criando vídeo com ffmpeg...")

# Criar vídeo com ffmpeg
ffmpeg_cmd = [
    "ffmpeg", "-y",
    "-framerate", str(fps),
    "-i", os.path.join(frames_dir, "frame_%04d.png"),
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-crf", "23",
    "-preset", "medium",
    output_video
]

subprocess.run(ffmpeg_cmd, check=True)

print(f"Vídeo criado: {output_video}")

# Limpar frames
print("Limpando frames temporários...")
for f in os.listdir(frames_dir):
    os.remove(os.path.join(frames_dir, f))
os.rmdir(frames_dir)

print("Concluído!")
