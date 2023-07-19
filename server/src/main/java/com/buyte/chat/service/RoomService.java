package com.buyte.chat.service;

import com.buyte.chat.dto.RoomRequest;
import com.buyte.chat.dto.RoomResponse;
import com.buyte.chat.entity.ChatRoom;
import com.buyte.chat.repository.ChatRoomRepository;
import com.buyte.member.auth.utils.SecurityUtil;
import com.buyte.member.entity.Member;
import com.buyte.member.repository.MemberRepository;
import com.buyte.store.entity.Store;
import com.buyte.store.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;


@Service
@RequiredArgsConstructor
@Slf4j
public class RoomService {

    private final ChatRoomRepository chatRoomRepository;
    private final MemberRepository memberRepository;
    private final StoreRepository storeRepository;

    public RoomResponse findOrCreate(RoomRequest roomRequest) {

        long authenticatedMemberId = SecurityUtil.getLoginMemberId();
        Member custromer = memberRepository.findById(authenticatedMemberId).orElseThrow();
        Store store = storeRepository.findById(roomRequest.getStoreId()).orElseThrow();
        Member merchant = store.getMember();
        ChatRoom room = chatRoomRepository.findByCustomerAndMerchant(custromer, merchant)
                .orElseGet(() -> new ChatRoom(merchant,custromer));
        ChatRoom chatRoom = chatRoomRepository.save(room);

        return RoomResponse.builder()
                .senderId(custromer.getMemberId())
                .receiverId(merchant.getMemberId())
                .roomId(chatRoom.getRoomId())
                .build();

    }

    public List<RoomResponse> findAllRoom() {

        long authenticatedMemberId = SecurityUtil.getLoginMemberId();
        Member merchant = memberRepository.findById(authenticatedMemberId).orElseThrow();
        List<ChatRoom> allChatRoom = chatRoomRepository.findAllByMerchant(merchant);
        List<RoomResponse> allRoomDto = new ArrayList<>();

        for(ChatRoom chatRoom : allChatRoom) {
            RoomResponse roomResponse = RoomResponse.builder().roomId(chatRoom.getRoomId())
                    .senderId(chatRoom.getMerchant().getMemberId())
                    .receiverId(chatRoom.getCustomer().getMemberId())
                    .build();
            allRoomDto.add(roomResponse);
        }

        return allRoomDto;
    }
}
