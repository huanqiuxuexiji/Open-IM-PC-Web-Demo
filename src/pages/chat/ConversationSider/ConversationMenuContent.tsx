import { Spin } from "antd";
import { t } from "i18next";
import { FC, memo, useState } from "react";

import { IMSDK } from "@/layout/MainContentWrap";
import { useConversationStore } from "@/store";
import { feedbackToast } from "@/utils/common";
import { ConversationItem } from "@/utils/open-im-sdk-wasm/types/entity";

const MenuItem: FC<{ title: string; onClick: () => void }> = ({ title, onClick }) => (
  <div
    className="cursor-pointer rounded px-3 py-2 text-xs hover:bg-[var(--primary-active)]"
    onClick={onClick}
  >
    {title}
  </div>
);

const ConversationMenuContent = memo(
  ({
    conversation,
    closeConversationMenu,
  }: {
    conversation: ConversationItem;
    closeConversationMenu: () => void;
  }) => {
    const [loading, setLoading] = useState(false);
    const delConversationByCID = useConversationStore(
      (state) => state.delConversationByCID,
    );

    const updateConversationPin = async () => {
      setLoading(true);
      try {
        await IMSDK.pinConversation({
          conversationID: conversation.conversationID,
          isPinned: !conversation.isPinned,
        });
      } catch (error) {
        feedbackToast({ error, msg: t("toast.pinConversationFailed") });
      }
      setLoading(false);
      closeConversationMenu();
    };

    const removeConversation = async () => {
      setLoading(true);
      try {
        await IMSDK.deleteConversation(conversation.conversationID);
        delConversationByCID(conversation.conversationID);
      } catch (error) {
        feedbackToast({ error, msg: t("toast.deleteConversationFailed") });
      }
      setLoading(false);
      closeConversationMenu();
    };

    const markConversationAsRead = async () => {
      setLoading(true);
      try {
        await IMSDK.markConversationMessageAsRead(conversation.conversationID);
      } catch (error) {
        feedbackToast({ error });
      }
      setLoading(false);
      closeConversationMenu();
    };

    return (
      <Spin spinning={loading}>
        <div className="p-1">
          <MenuItem
            title={`${conversation.isPinned ? "取消" : ""}置顶`}
            onClick={updateConversationPin}
          />
          {Boolean(conversation.unreadCount) && (
            <MenuItem title={"标为已读"} onClick={markConversationAsRead} />
          )}
          <MenuItem title={"移除"} onClick={removeConversation} />
        </div>
      </Spin>
    );
  },
);

export default ConversationMenuContent;
