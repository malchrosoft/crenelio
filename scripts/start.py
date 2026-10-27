#!/usr/bin/env python3
"""
Crénelio - Démarrage multiplateforme (Windows, macOS, Linux).
- Vérifie et prépare api/.env
- Démarre les conteneurs Docker (crenelio-db & crenelio-api)
- Vérifie la disponibilité de MySQL et de l'API HTTP
- Lance le serveur Vite en avant-plan, puis ouvre le navigateur dès qu'il répond :
  npm start [navigateur|tous|aucun] [chemin]   (défaut : navigateur par défaut, page d'accueil)
- Nettoie proprement à l'interruption (Ctrl+C)
"""

import os
import shutil
import subprocess
import sys
import threading
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
    print_step("Démarrage des conteneurs Docker (MySQL, API PHP, Mailpit)...")
    if shutil.which("docker") is None:
        print_err("Commande `docker` introuvable.")
        print("   Installez Docker Desktop, ou la commande seule si vous utilisez colima :")
        print("   brew install docker docker-compose   (puis `colima start` si colima est arrêté)")
        sys.exit(1)
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

def print_urls(port: int):
    """Adresses utiles pour tester l'application en local."""
    app = f"http://localhost:{port}"
    urls = [
        ("Vitrine", app + "/"),
        ("Réservation", app + "/booking"),
        ("Espace Artisan", app + "/admin  (mot de passe : admin123)"),
        ("Emails capturés", "http://localhost:8025  (Mailpit)"),
        ("API PHP", "http://localhost:8000/api/config"),
        ("Base MySQL", "127.0.0.1:3306  (crenelio / crenelio_dev)"),
    ]
    width = max(len(label) for label, _ in urls)
    print("\n🔗 Adresses utiles :")
    for label, url in urls:
        print(f"   {label.ljust(width)}  {url}")
    print()


def open_browser_when_ready(port: int, args: list):
    """Attend que Vite réponde, puis délègue l'ouverture à scripts/ouvrir.mjs."""
    url = f"http://localhost:{port}"
    for _ in range(60):
        try:
            with urllib.request.urlopen(url, timeout=1):
                break
        except Exception:
            time.sleep(0.5)
    else:
        print_warn("Vite ne répond pas : navigateur non ouvert.")
        return
    subprocess.run(
        ["node", os.path.join("scripts", "ouvrir.mjs"), *args],
        env={**os.environ, "CRENELIO_URL": url},
    )


def port_in_use(port: int) -> bool:
    import socket
    for family, host in ((socket.AF_INET, "127.0.0.1"), (socket.AF_INET6, "::1")):
        try:
            with socket.socket(family, socket.SOCK_STREAM) as sock:
                sock.settimeout(0.3)
                if sock.connect_ex((host, port)) == 0:
                    return True
        except OSError:
            continue
    return False


def run_vite(browser_args: list):
    import socket
    print("\n" + "=" * 55)
    print("💻 Lancement du serveur Vite...")
    # Déterminer un port libre, à partir de 5173 (port attendu par APP_URL dans docker-compose.yml)
    base_port = 5173
    max_port = 5180
    selected_port = None
    for port in range(base_port, max_port + 1):
        # Port occupé si un serveur y répond déjà (IPv4 ou IPv6 : Vite écoute souvent sur ::1),
        # ou s'il ne peut pas être réservé
        if port_in_use(port):
            continue
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
    if selected_port != base_port:
        print_warn(f"Port {base_port} occupé : les liens des emails (APP_URL) pointeront vers {base_port}.")
    print_urls(selected_port)
    subprocess.run(["node", os.path.join("scripts", "ouvrir.mjs"), "liste"])
    print("👉 Appuyez sur Ctrl+C pour arrêter le serveur.")
    print("=" * 55 + "\n", flush=True)
    # Utilise npx vite avec le port choisi, portable Windows/macOS/Linux
    # --strictPort : Vite ne glisse pas sur un autre port que celui annoncé ci-dessus
    cmd = ["npx", "vite", "--port", str(selected_port), "--strictPort"]
    if sys.platform == "win32":
        cmd = ["npx.cmd", "vite", "--port", str(selected_port), "--strictPort"]
    threading.Thread(target=open_browser_when_ready, args=(selected_port, browser_args), daemon=True).start()
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
    # npm start safari admin → ["safari", "admin"]
    run_vite(sys.argv[1:])

if __name__ == "__main__":
    main()
