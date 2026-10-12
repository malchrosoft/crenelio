#!/usr/bin/env python3
"""
Crénelio - Démarrage multiplateforme (Windows, macOS, Linux).
- Vérifie et prépare api/.env
- Démarre les conteneurs Docker (crenelio-db & crenelio-api)
- Vérifie la disponibilité de MySQL et de l'API HTTP
- Lance le serveur Vite en avant-plan
- Nettoie proprement à l'interruption (Ctrl+C)
"""

import os
import shutil
import subprocess
import sys
import time
import urllib.request
import urllib.error

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT_DIR)

def print_step(msg: str):
    print(f"\n🚀 {msg}", flush=True)

def print_ok(msg: str):
    print(f"✅ {msg}", flush=True)

def print_warn(msg: str):
    print(f"⚠️  {msg}", flush=True)

def print_err(msg: str):
    print(f"❌ {msg}", flush=True)

def check_env_file():
    env_path = os.path.join(ROOT_DIR, "api", ".env")
    example_path = os.path.join(ROOT_DIR, "api", ".env.example")
    if not os.path.isfile(env_path) and os.path.isfile(example_path):
        print_step("Création de api/.env depuis api/.env.example...")
        shutil.copyfile(example_path, env_path)
        print_ok("api/.env créé.")

def start_docker():
    print_step("Démarrage des conteneurs Docker (DB MySQL & API PHP)...")
    cmd = ["docker", "compose", "up", "-d"]
    res = subprocess.run(cmd)
    if res.returncode != 0:
        print_err("Échec du démarrage de Docker Compose. Vérifiez que Docker Desktop est lancé.")
        sys.exit(1)
    print_ok("Conteneurs Docker lancés.")

def wait_for_mysql():
    print_step("Vérification de MySQL (port 3306)...")
    max_attempts = 30
    cmd = [
        "docker", "exec", "crenelio-db",
        "mysqladmin", "ping", "-u", "crenelio", "-pcrenelio_dev", "--silent"
    ]
    for attempt in range(1, max_attempts + 1):
        res = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if res.returncode == 0:
            print_ok("Base de données MySQL opérationnelle.")
            return
        time.sleep(1)
    print_err("Délai d'attente dépassé pour la base MySQL.")
    sys.exit(1)

def wait_for_api():
    print_step("Vérification de l'API PHP (http://127.0.0.1:8000/api/config)...")
    url = "http://127.0.0.1:8000/api/config"
    max_attempts = 20
    for attempt in range(1, max_attempts + 1):
        try:
            with urllib.request.urlopen(url, timeout=2) as response:
                if response.status == 200:
                    print_ok("API Backend opérationnelle.")
                    return
        except Exception:
            pass
        time.sleep(1)
    print_warn("L'API met du temps à répondre. Poursuite du démarrage...")

def run_vite():
    import socket
    print("\n" + "=" * 55)
    print("💻 Lancement du serveur Vite...")
    # Déterminer un port libre, à partir de 5173
    base_port = 5174
    max_port = 5181
    selected_port = None
    for port in range(base_port, max_port + 1):
        # Vérifier si le port est disponible
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            try:
                sock.bind(("127.0.0.1", port))
                selected_port = port
                break
            except OSError:
                continue
    if selected_port is None:
        print_err("Aucun port disponible entre 5173 et 5180. Abandon du lancement Vite.")
        return
    print_ok(f"Port {selected_port} sélectionné pour Vite.")
    print(f"👉 Application accessible sur : http://localhost:{selected_port}")
    print("👉 Espace Admin accessible avec mot de passe : admin123")
    print("👉 Appuyez sur Ctrl+C pour arrêter le serveur.")
    print("=" * 55 + "\n", flush=True)
    # Utilise npx vite avec le port choisi, portable Windows/macOS/Linux
    cmd = ["npx", "vite", "--port", str(selected_port)]
    if sys.platform == "win32":
        cmd = ["npx.cmd", "vite", "--port", str(selected_port)]
    try:
        subprocess.run(cmd)
    except KeyboardInterrupt:
        print("\nArrêt du serveur Vite...")

def main():
    print("=" * 55)
    print(" Crénelio - Démarrage de l'environnement complet")
    print("=" * 55)
    check_env_file()
    start_docker()
    wait_for_mysql()
    wait_for_api()
    run_vite()

if __name__ == "__main__":
    main()
