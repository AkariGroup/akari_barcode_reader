import argparse
import time
import cv2
from pyzbar.pyzbar import decode as pyzbar_decode
import requests

from akari_client import AkariClient
from lib.oakd_yolo import OakdYolo

#バーコード情報送信先のurl
# パスに/api/scanを指定すること
registerUrl =  "http://localhost:3000/api/scan"

class BarcodeScannerApp(OakdYolo):
    def __init__(self, config_path: str, model_path: str, fps: int = 10) -> None:
        # 親クラス(OakdYolo)の初期化
        super().__init__(config_path, model_path, fps)

        self.akari = AkariClient()
        self.joints = self.akari.joints
        self.joints.enable_all_servo()
        self.joints.move_joint_positions(sync=True, pan=0, tilt=0)
        time.sleep(1)

        # --- 最後に読み取ったデータを保持する変数 ---
        self.last_sent_barcode = None
        self.last_sent_time = 0

    def send_barcode_request(self, barcode_data: str) -> bool:
        # 13桁の半角数字であるか検証
        if not (len(barcode_data) == 13 and barcode_data.isdecimal()):
            print(f"INFO: 13桁の数字ではないため、データ({barcode_data})を送信しません。")
            return False

        current_time = time.time()
        if barcode_data == self.last_sent_barcode and (current_time - self.last_sent_time) < 10:
             return False

        print(f"REQUEST: サーバー({registerUrl})にデータ({barcode_data})を送信します...")
        params = {'id': barcode_data}
        try:
            response = requests.get(registerUrl, params=params)
            if response.status_code == 200:
                print(f"✅ SUCCESS! 応答: {response.json()}")
                self.last_sent_barcode = barcode_data
                self.last_sent_time = current_time
                return True
            else:
                print(f"ERROR ステータスコード: {response.status_code}, 応答: {response.text}")
                return False
        except requests.exceptions.RequestException as e:
            print(f"CONNECTION ERROR: サーバーに接続できませんでした。: {e}")
            return False

    def nod_action(self) -> None:
        try:
            self.joints.move_joint_positions(tilt=0.3, sync=True)
            time.sleep(0.5)
            self.joints.move_joint_positions(tilt=-0.3, sync=True)
            time.sleep(0.5)
            self.joints.move_joint_positions(tilt=0, sync=True)
            time.sleep(0.5)
        except Exception as e:
            print(f"エラー: サーボの動作に失敗しました。: {e}")

    def loop(self) -> None:

        print("INFO: バーコードの検出を開始します。ウィンドウで'q'を押すか、ターミナルでCtrl+Cで終了します。")
        end = False
        while not end:
            try:
                frame, detections = self.get_frame()
                if frame is not None:
                    if len(detections) > 0:
                        d = detections[0]
                        frame_height, frame_width, _ = frame.shape
                        xmin, ymin, xmax, ymax = map(int, [d.xmin * frame_width, d.ymin * frame_height, d.xmax * frame_width, d.ymax * frame_height])

                        if xmax > xmin and ymax > ymin:
                            cropped_barcode_image = frame[ymin:ymax, xmin:xmax]
                            decoded_objects = pyzbar_decode(cropped_barcode_image)
                            if decoded_objects:
                                barcode_data = decoded_objects[0].data.decode('utf-8')

                                # サーバーに送信し、成功した場合のみ頷く
                                if self.send_barcode_request(barcode_data):
                                    self.nod_action()

                    self.display_frame("AKARI Barcode Scanner", frame, detections)

                if cv2.waitKey(1) == ord("q"):
                    end = True
            except KeyboardInterrupt:
                print("\nINFO: Ctrl+Cが押されたため、プログラムを終了します。")
                end = True
            except Exception as e:
                print(f"エラー: メインループで予期せぬエラーが発生しました。: {e}")
                end = True

        self.close()
        print("INFO: カメラを解放しました。")

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("-m", "--model", help="YOLO model path", default="models/barcode.blob", type=str)
    parser.add_argument("-c", "--config", help="YOLO config path", default="config/barcode.json", type=str)
    parser.add_argument("-f", "--fps", help="Camera frame fps", default=10, type=int)
    args = parser.parse_args()

    app = BarcodeScannerApp(
        config_path=args.config,
        model_path=args.model,
        fps=args.fps,
    )
    app.loop()

if __name__ == "__main__":
    main()
