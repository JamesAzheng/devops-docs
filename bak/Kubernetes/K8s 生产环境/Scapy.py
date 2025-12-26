from scapy.all import sniff, wrpcap, Ether, ARP, IP, TCP

pcap_path = "capture.pcap"

def packet_callback(packet):
    if Ether in packet and IP in packet and TCP in packet and ARP not in packet:
        src_ip = packet[IP].src
        dst_ip = packet[IP].dst
        src_port = packet[TCP].sport
        dst_port = packet[TCP].dport

        if src_ip != "114.114.114.114" and src_ip != "169.254.25.10" and \
                dst_port not in [3306, 9200, 30196]:
            # 处理满足条件的数据包
            wrpcap(pcap_path, packet, append=True)  # 将数据包写入pcap文件

# 捕获满足条件的数据包并写入pcap文件
sniff(filter="not arp", prn=packet_callback, store=0)

print("数据包捕获完成，保存在", pcap_path)
