import React, { useState, useMemo } from 'react';
import Modal from './Modal';
import { GameState, AdCampaign, SimulatedComment, SocialMediaPost } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface SocialMediaModalProps {
    isOpen: boolean;
    onClose: () => void;
    gameState: GameState;
    onPost: (content: string) => Promise<void>;
    onLaunchCampaign: (campaign: Omit<AdCampaign, 'daysRemaining'>) => void;
    campaigns: Omit<AdCampaign, 'daysRemaining'>[];
    isLoading: boolean;
    onReply: (postId: string, commentIndex: number, replyText: string) => void;
    onDeletePost: (postId: string) => void;
    onBlockUser: (author: string) => void;
    onPinPost: (postId: string) => void;
    onBoostPost: (postId: string) => void;
}

interface PixelButtonProps {
    children: React.ReactNode;
    onClick?: () => any;
    disabled?: boolean;
    className?: string;
    title?: string;
}
const PixelButton: React.FC<PixelButtonProps> = ({ children, onClick, disabled = false, className = "", title }) => (
    <button onClick={onClick} disabled={disabled} title={title} className={`p-2 bg-[#e5e5e5] border-2 border-black text-black text-xs hover:bg-yellow-300 disabled:bg-gray-500 disabled:text-gray-400 disabled:cursor-not-allowed ${className}`}>{children}</button>
);

const SocialMediaModal: React.FC<SocialMediaModalProps> = (props) => {
    const { 
        isOpen, onClose, gameState, onPost, onLaunchCampaign, campaigns, 
        isLoading, onReply, onDeletePost, onBlockUser, onPinPost, onBoostPost 
    } = props;
    
    const [view, setView] = useState<'feed' | 'marketing'>('feed');
    const [postContent, setPostContent] = useState('');
    const [replyingTo, setReplyingTo] = useState<{ postId: string; commentIndex: number } | null>(null);
    const [replyText, setReplyText] = useState('');
    const [activePostMenu, setActivePostMenu] = useState<string | null>(null);


    const handlePost = async () => {
        await onPost(postContent);
        setPostContent('');
    };
    
    const handleSendReply = () => {
        if (replyingTo && replyText.trim()) {
            onReply(replyingTo.postId, replyingTo.commentIndex, replyText);
            setReplyingTo(null);
            setReplyText('');
        }
    };
    
    const handleDeleteWithConfirm = (postId: string) => {
        if (window.confirm("Ви впевнені, що хочете видалити цей допис? Цю дію не можна скасувати.")) {
            onDeletePost(postId);
        }
        setActivePostMenu(null);
    };

    const getSentimentColor = (sentiment: SimulatedComment['sentiment']) => {
        switch(sentiment) {
            case 'positive': return 'text-green-400';
            case 'negative': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    const isPlayerPost = (post: SocialMediaPost) => post.author.includes('Цитрін');

    const orderedPosts = useMemo(() => {
        const { posts, pinnedPostId } = gameState.socialMedia;
        const pinnedPost = posts.find(p => p.id === pinnedPostId);
        const otherPosts = posts.filter(p => p.id !== pinnedPostId);
        return pinnedPost ? [pinnedPost, ...otherPosts] : otherPosts;
    }, [gameState.socialMedia.posts, gameState.socialMedia.pinnedPostId]);

    const renderFeed = () => (
         <div>
            <div className="mb-2">
                <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Що нового у 'Цитрін'?.."
                    className="w-full h-20 p-2 border-2 border-white bg-gray-700 text-white placeholder-gray-400 text-xs"
                    maxLength={280}
                />
                <div className="flex justify-between items-center mt-1">
                    <span className="text-[10px] text-gray-500">{postContent.length}/280</span>
                    <PixelButton onClick={handlePost} disabled={!postContent.trim() || isLoading} className="px-8">
                        {isLoading ? <LoadingSpinner/> : 'Опублікувати'}
                    </PixelButton>
                </div>
            </div>
            <div className="max-h-64 overflow-y-auto pr-2 space-y-3">
                {orderedPosts.map(post => {
                    const isPinned = post.id === gameState.socialMedia.pinnedPostId;
                    const isBoosted = gameState.socialMedia.boostedPosts.some(p => p.postId === post.id);
                    const isBotAttacked = post.comments.some(c => c.isBot);

                    return (
                        <div key={post.id} className={`p-2 border text-white relative ${isPinned ? 'border-yellow-400 border-2 bg-gray-800' : 'border-white bg-gray-700'} ${isBoosted ? 'shadow-lg shadow-blue-500/50' : ''} ${isBotAttacked ? 'border-red-500' : ''}`}>
                             <div className="flex justify-between items-start">
                                <p className="text-xs">
                                    <strong className="flex items-center gap-2">
                                        <span className='text-lg'>{post.authorIcon}</span>
                                        <span>{post.author}</span>
                                        <span className="font-normal text-gray-400">(День {post.day})</span>
                                        {isPinned && <span title="Закріплений допис" className="text-yellow-400">⭐</span>}
                                        {isBoosted && <span title="Допис просувається" className="text-blue-400 animate-pulse">🚀</span>}
                                    </strong>
                                </p>
                                {isPlayerPost(post) && (
                                    <div className="relative">
                                        <button onClick={() => setActivePostMenu(activePostMenu === post.id ? null : post.id)} className="font-bold text-lg leading-none px-2 hover:bg-gray-600">...</button>
                                        {activePostMenu === post.id && (
                                            <div className="absolute right-0 mt-1 w-40 bg-gray-900 border border-black text-white text-xs z-10">
                                                <button onClick={() => { onPinPost(post.id); setActivePostMenu(null); }} className="block w-full text-left px-2 py-1 hover:bg-gray-700">{isPinned ? 'Відкріпити' : 'Закріпити'}</button>
                                                <button onClick={() => { onBoostPost(post.id); setActivePostMenu(null); }} disabled={isBoosted} className="block w-full text-left px-2 py-1 hover:bg-gray-700 disabled:text-gray-500">Просунути ($250)</button>
                                                <button onClick={() => handleDeleteWithConfirm(post.id)} className="block w-full text-left px-2 py-1 hover:bg-red-700 text-red-400">Видалити</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <p className="my-1 text-sm">{post.content}</p>
                            <div className="border-t border-gray-500 mt-2 pt-2 space-y-1">
                                {isBotAttacked && <p className="text-red-500 text-center text-xs font-bold animate-pulse">*** АТАКА БОТІВ ***</p>}
                                {post.comments.filter(c => !gameState.player.blockedUsers.includes(c.author)).map((comment, i) => (
                                    <div key={i} className={`text-xs p-1 ${comment.isBot ? 'bg-red-900/50' : 'bg-gray-800'}`}>
                                        <div className="flex justify-between items-center">
                                            <p className={getSentimentColor(comment.sentiment)}><strong>{comment.author}:</strong> {comment.text}</p>
                                            {!isPlayerPost(post) && !comment.author.includes("Цитрін") && !gameState.competitors.some(c => c.name === comment.author) && (
                                                <button onClick={() => onBlockUser(comment.author)} title={`Заблокувати ${comment.author}`} className="text-red-500 text-xs px-1 hover:bg-red-800 opacity-50 hover:opacity-100">🚫</button>
                                            )}
                                        </div>

                                        {comment.replies && comment.replies.map((reply, rIndex) => (
                                            <div key={rIndex} className="ml-4 mt-1 pl-2 border-l-2 border-gray-600">
                                                <p><strong>{reply.author}:</strong> {reply.text}</p>
                                            </div>
                                        ))}

                                        {replyingTo?.postId === post.id && replyingTo?.commentIndex === i ? (
                                            <div className="flex gap-1 mt-1">
                                                <input 
                                                    type="text" value={replyText} onChange={(e) => setReplyText(e.target.value)}
                                                    className="flex-grow bg-gray-900 text-white p-1 text-xs"
                                                    placeholder="Ваша відповідь..." autoFocus onKeyDown={e => e.key === 'Enter' && handleSendReply()}
                                                />
                                                <button onClick={handleSendReply} className="text-xs bg-blue-500 px-2">»</button>
                                            </div>
                                        ) : ( isPlayerPost(post) &&
                                            <button onClick={() => setReplyingTo({ postId: post.id, commentIndex: i })} className="text-[10px] text-blue-400 hover:underline mt-1">
                                                Відповісти
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
    
    const renderMarketing = () => (
        <div>
            {gameState.socialMedia.activeCampaign ? (
                 <div className="text-center p-4 border-2 border-black bg-yellow-100">
                    <h4 className="font-bold text-base">Активна кампанія: {gameState.socialMedia.activeCampaign.name}</h4>
                    <p>Ефект: +{ (gameState.socialMedia.activeCampaign.effectMultiplier - 1) * 100 }% до попиту</p>
                    <p>Залишилось днів: {gameState.socialMedia.activeCampaign.daysRemaining}</p>
                 </div>
            ) : (
                <div className="space-y-3">
                    {campaigns.map(campaign => {
                        const canAfford = gameState.player.money >= campaign.cost;
                        return(
                        <div key={campaign.type} className="bg-gray-100 border-2 border-black p-3 flex justify-between items-center">
                            <div>
                                <p className="font-bold">{campaign.name}</p>
                                <p className="text-xs">Вартість: ${campaign.cost} | Тривалість: {campaign.duration} д. | Ефект: +{(campaign.effectMultiplier - 1) * 100}%</p>
                            </div>
                            <PixelButton onClick={() => onLaunchCampaign(campaign)} disabled={!canAfford}>
                                Запустити
                            </PixelButton>
                        </div>
                    )})}
                </div>
            )}
        </div>
    );


    return (
        <Modal title="Соцмережі та Маркетинг" isOpen={isOpen} onClose={onClose}>
            <div className="flex gap-2 border-b-2 border-black pb-2 mb-2">
                <PixelButton onClick={() => setView('feed')} className={view === 'feed' ? 'bg-yellow-300' : ''}>Стрічка</PixelButton>
                <PixelButton onClick={() => setView('marketing')} className={view === 'marketing' ? 'bg-yellow-300' : ''}>Рекламні кампанії</PixelButton>
            </div>

            {view === 'feed' ? renderFeed() : renderMarketing()}
        </Modal>
    );
};

export default SocialMediaModal;